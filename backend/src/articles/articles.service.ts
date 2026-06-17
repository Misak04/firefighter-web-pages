import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import slugify from 'slugify';
import DOMPurify from 'isomorphic-dompurify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { Article, ArticleStatus } from '../../generated/prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(query: QueryArticlesDto) {
    const { page, limit, q } = query;
    const skip = (page - 1) * limit;

    if (q && q.trim().length > 0) {
      const [items, totalResult] = await Promise.all([
        this.prisma.$queryRaw<Article[]>`
          SELECT * FROM "Article"
          WHERE status = 'PUBLISHED' AND "searchVector" @@ to_tsquery('english', ${this.toTsQuery(q)})
          ORDER BY "publishedAt" DESC
          LIMIT ${limit} OFFSET ${skip}
        `,
        this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM "Article"
          WHERE status = 'PUBLISHED' AND "searchVector" @@ to_tsquery('english', ${this.toTsQuery(q)})
        `,
      ]);
      return { items, total: Number(totalResult[0]?.count ?? 0), page, limit };
    }

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    ]);
    return { items, total, page, limit };
  }

  async findPublishedBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({ where: { slug } });
    if (!article || article.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async findOneForAdmin(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async create(dto: CreateArticleDto, authorId: string) {
    const slug = await this.generateUniqueSlug(dto.title);
    const status = dto.status ?? ArticleStatus.DRAFT;

    return this.prisma.article.create({
      data: {
        title: dto.title,
        slug,
        body: this.sanitize(dto.body),
        status,
        authorId,
        publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  async update(id: string, dto: UpdateArticleDto) {
    const existing = await this.findOneForAdmin(id);

    const becomingPublished = dto.status === ArticleStatus.PUBLISHED && existing.status !== ArticleStatus.PUBLISHED;

    return this.prisma.article.update({
      where: { id },
      data: {
        title: dto.title,
        body: dto.body !== undefined ? this.sanitize(dto.body) : undefined,
        status: dto.status,
        publishedAt: becomingPublished ? new Date() : undefined,
      },
    });
  }

  async remove(id: string, requesterRole: string) {
    if (requesterRole !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can delete articles');
    }
    await this.findOneForAdmin(id);
    await this.prisma.article.delete({ where: { id } });
  }

  private sanitize(body: string): string {
    return DOMPurify.sanitize(body);
  }

  private toTsQuery(q: string): string {
    return q
      .trim()
      .split(/\s+/)
      .map((term) => term.replace(/[^\w]/g, ''))
      .filter(Boolean)
      .join(' & ');
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title, { lower: true, strict: true });
    let slug = base;
    let suffix = 1;
    while (await this.prisma.article.findUnique({ where: { slug } })) {
      slug = `${base}-${++suffix}`;
    }
    return slug;
  }
}
