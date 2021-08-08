import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductPricingJSON1628432642436 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (process.env.TYPEORM_CONNECTION !== 'postgres') {
      await queryRunner.query('ALTER TABLE `product_pricing` MODIFY `data` TEXT');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (process.env.TYPEORM_CONNECTION !== 'postgres') {
      await queryRunner.query('ALTER TABLE `product_pricing` MODIFY `data` LONGTEXT');
    }
  }
}
