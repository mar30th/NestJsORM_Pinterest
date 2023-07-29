import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { UserUpdateDto } from './user.dto/user-update.dto.js';

@Injectable()
export class UserService {
  private prisma: PrismaClient;
  constructor(private readonly jwtService: JwtService) {
    this.prisma = new PrismaClient();
  }

  // GET Thông tin user
  async getUser() {
    const data = await this.prisma.user.findMany({
      select: {
        user_id: true,
        email: true,
        full_name: true,
        age: true,
        avatar: true,
      },
    });
    return data;
  }

  // // GET lấy thông tin user theo email
  async getUserByEmail(email: string) {
    const data = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    return data;
  }

  // GET danh sách ảnh đã lưu theo user_id
  async getSavedImageByUserId(user_id: number) {
    const data = await this.prisma.user.findUnique({
      where: {
        user_id,
      },
      include: {
        save_image: true,
      },
    });

    return data;
  }

  // GET danh sách ảnh đã tạo theo user_id
  async getImageCreatedByUserId(user_id: number) {
    const data = await this.prisma.user.findUnique({
      where: {
        user_id,
      },
      include: {
        image: true,
      },
    });

    return data;
  }

  // POST cập nhật thông tin user
  async postUpdateUser(token: string, data: UserUpdateDto) {
    const decodedToken = this.jwtService.decode(
      token.replace('Bearer ', ''),
    ) as any;
    const user_id = decodedToken?.data?.user_id;
    if (!user_id) {
      throw new UnauthorizedException('Invalid Token');
    } else {
      await this.prisma.user.update({
        where: {
          user_id,
        },
        data,
      });
      return { message: 'User updated!', dataUpdated: data };
    }
  }
}
