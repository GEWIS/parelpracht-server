import { MigrationInterface, QueryRunner } from 'typeorm';
import replaceAll from '../helpers/replaceAll';

export class Localization1627468331061 implements MigrationInterface {
  name = 'Localization1627468331061';

  private async query(queryRunner: QueryRunner, query: string): Promise<unknown> {
    if (process.env.TYPEORM_CONNECTION === 'postgres') {
      return queryRunner.query(replaceAll(query, '`', '"'));
    }
    return queryRunner.query(query);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.query(queryRunner, 'ALTER TABLE `contract_activity` ADD `descriptionDutch` text');
    await this.query(queryRunner, 'ALTER TABLE `invoice_activity` ADD `descriptionDutch` text');
    await this.query(queryRunner, 'ALTER TABLE `product_activity` ADD `descriptionDutch` text');
    await this.query(queryRunner, 'ALTER TABLE `product_instance_activity` ADD `descriptionDutch` text');
    await this.query(queryRunner, 'ALTER TABLE `company_activity` ADD `descriptionDutch` text');
    await this.query(queryRunner, 'ALTER TABLE `contract_activity` ADD `descriptionEnglish` text');
    await this.query(queryRunner, 'ALTER TABLE `invoice_activity` ADD `descriptionEnglish` text');
    await this.query(queryRunner, 'ALTER TABLE `product_activity` ADD `descriptionEnglish` text');
    await this.query(queryRunner, 'ALTER TABLE `product_instance_activity` ADD `descriptionEnglish` text');
    await this.query(queryRunner, 'ALTER TABLE `company_activity` ADD `descriptionEnglish` text');

    await this.query(
      queryRunner,
      'UPDATE `contract_activity` SET `descriptionDutch` = `description`, `descriptionEnglish` = `description`',
    );
    await this.query(
      queryRunner,
      'UPDATE `invoice_activity` SET `descriptionDutch` = `description`, `descriptionEnglish` = `description`',
    );
    await this.query(
      queryRunner,
      'UPDATE `product_activity` SET `descriptionDutch` = `description`, `descriptionEnglish` = `description`',
    );
    await this.query(
      queryRunner,
      'UPDATE `product_instance_activity` SET `descriptionDutch` = `description`, `descriptionEnglish` = `description`',
    );
    await this.query(
      queryRunner,
      'UPDATE `company_activity` SET `descriptionDutch` = `description`, `descriptionEnglish` = `description`',
    );

    if (process.env.TYPEORM_CONNECTION === 'postgres') {
      await this.query(queryRunner, 'ALTER TABLE `contract_activity` ALTER COLUMN `descriptionDutch` SET NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `invoice_activity` ALTER COLUMN `descriptionDutch` SET NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `product_activity` ALTER COLUMN `descriptionDutch` SET NOT NULL');
      await this.query(
        queryRunner,
        'ALTER TABLE `product_instance_activity` ALTER COLUMN `descriptionDutch` SET NOT NULL',
      );
      await this.query(queryRunner, 'ALTER TABLE `company_activity` ALTER COLUMN `descriptionDutch` SET NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `contract_activity` ALTER COLUMN `descriptionEnglish` SET NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `invoice_activity` ALTER COLUMN `descriptionEnglish` SET NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `product_activity` ALTER COLUMN `descriptionEnglish` SET NOT NULL');
      await this.query(
        queryRunner,
        'ALTER TABLE `product_instance_activity` ALTER COLUMN `descriptionEnglish` SET NOT NULL',
      );
      await this.query(queryRunner, 'ALTER TABLE `company_activity` ALTER COLUMN `descriptionEnglish` SET NOT NULL');
    } else {
      await this.query(queryRunner, 'ALTER TABLE `contract_activity` MODIFY `descriptionDutch` text NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `invoice_activity` MODIFY `descriptionDutch` text NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `product_activity` MODIFY `descriptionDutch` text NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `product_instance_activity` MODIFY `descriptionDutch` text NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `company_activity` MODIFY `descriptionDutch` text NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `contract_activity` MODIFY `descriptionEnglish` text NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `invoice_activity` MODIFY `descriptionEnglish` text NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `product_activity` MODIFY `descriptionEnglish` text NOT NULL');
      await this.query(
        queryRunner,
        'ALTER TABLE `product_instance_activity` MODIFY `descriptionEnglish` text NOT NULL',
      );
      await this.query(queryRunner, 'ALTER TABLE `company_activity` MODIFY `descriptionEnglish` text NOT NULL');
    }

    await this.query(queryRunner, 'ALTER TABLE `contract_activity` DROP COLUMN `description`');
    await this.query(queryRunner, 'ALTER TABLE `invoice_activity` DROP COLUMN `description`');
    await this.query(queryRunner, 'ALTER TABLE `product_activity` DROP COLUMN `description`');
    await this.query(queryRunner, 'ALTER TABLE `product_instance_activity` DROP COLUMN `description`');
    await this.query(queryRunner, 'ALTER TABLE `company_activity` DROP COLUMN `description`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.query(queryRunner, 'ALTER TABLE `company_activity` ADD `description` varchar');
    await this.query(queryRunner, 'ALTER TABLE `product_instance_activity` ADD `description` varchar');
    await this.query(queryRunner, 'ALTER TABLE `product_activity` ADD `description` varchar');
    await this.query(queryRunner, 'ALTER TABLE `invoice_activity` ADD `description` varchar');
    await this.query(queryRunner, 'ALTER TABLE `contract_activity` ADD `description` varchar');

    await this.query(queryRunner, 'UPDATE `company_activity` SET `description` = `descriptionEnglish`');
    await this.query(queryRunner, 'UPDATE `product_instance_activity` SET `description` = `descriptionEnglish`');
    await this.query(queryRunner, 'UPDATE `product_activity` SET `description` = `descriptionEnglish`');
    await this.query(queryRunner, 'UPDATE `invoice_activity` SET `description` = `descriptionEnglish`');
    await this.query(queryRunner, 'UPDATE `contract_activity` SET `description` = `descriptionEnglish`');

    if (process.env.TYPEORM_CONNECTION === 'postgres') {
      await this.query(queryRunner, 'ALTER TABLE `company_activity` ALTER COLUMN `description` SET NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `product_instance_activity` ALTER COLUMN `description` SET NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `product_activity` ALTER COLUMN `description` SET NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `invoice_activity` ALTER COLUMN `description` SET NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `contract_activity` ALTER COLUMN `description` SET NOT NULL');
    } else {
      await this.query(queryRunner, 'ALTER TABLE `company_activity` MODIFY `description` varchar NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `product_instance_activity` MODIFY `description` varchar NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `product_activity` MODIFY `description` varchar NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `invoice_activity` MODIFY `description` varchar NOT NULL');
      await this.query(queryRunner, 'ALTER TABLE `contract_activity` MODIFY `description` varchar NOT NULL');
    }

    await this.query(queryRunner, 'ALTER TABLE `company_activity` DROP COLUMN `descriptionEnglish`');
    await this.query(queryRunner, 'ALTER TABLE `product_instance_activity` DROP COLUMN `descriptionEnglish`');
    await this.query(queryRunner, 'ALTER TABLE `product_activity` DROP COLUMN `descriptionEnglish`');
    await this.query(queryRunner, 'ALTER TABLE `invoice_activity` DROP COLUMN `descriptionEnglish`');
    await this.query(queryRunner, 'ALTER TABLE `contract_activity` DROP COLUMN `descriptionEnglish`');
    await this.query(queryRunner, 'ALTER TABLE `company_activity` DROP COLUMN `descriptionDutch`');
    await this.query(queryRunner, 'ALTER TABLE `product_instance_activity` DROP COLUMN `descriptionDutch`');
    await this.query(queryRunner, 'ALTER TABLE `product_activity` DROP COLUMN `descriptionDutch`');
    await this.query(queryRunner, 'ALTER TABLE `invoice_activity` DROP COLUMN `descriptionDutch`');
    await this.query(queryRunner, 'ALTER TABLE `contract_activity` DROP COLUMN `descriptionDutch`');
  }
}
