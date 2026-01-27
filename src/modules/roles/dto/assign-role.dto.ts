import { IsInt, IsEnum } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class AssignRoleDto {
  @IsInt()
  userId: number;

  @IsEnum(Role)
  role: Role;
}
