import { BaseEntity } from "@medusajs/medusa";
import { Column, Entity } from "typeorm";

@Entity()
export class BannersPromotion extends BaseEntity {
  @Column()
  descripcion: string;

  publicar: boolean;

  @Column()
  image: string;
}
