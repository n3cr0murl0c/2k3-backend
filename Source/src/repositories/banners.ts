import { BannersPromotion } from "../models/banners";
import { dataSource } from "@medusajs/medusa/dist/loaders/database";

const BannersRepository = dataSource.getRepository(BannersPromotion);

export default BannersRepository;
