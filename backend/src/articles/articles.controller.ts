import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { AccessTokenPayload } from '../auth/auth.types';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @Get()
  findPublished(@Query() query: QueryArticlesDto) {
    return this.articlesService.findPublished(query);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Get('admin')
  findAllForAdmin(@Query() query: QueryArticlesDto) {
    return this.articlesService.findAllForAdmin(query);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Get('admin/:id')
  findOneForAdmin(@Param('id') id: string) {
    return this.articlesService.findOneForAdmin(id);
  }

  @Public()
  @Get(':slug')
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.articlesService.findPublishedBySlug(slug);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Post()
  create(@Body() dto: CreateArticleDto, @Req() req: Request) {
    const user = req.user as AccessTokenPayload;
    return this.articlesService.create(dto, user.sub);
  }

  @Roles(Role.EDITOR, Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
}
