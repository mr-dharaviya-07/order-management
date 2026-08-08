import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOtpFields1786187338310 implements MigrationInterface {
    name = 'AddOtpFields1786187338310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasOtpCol = await queryRunner.hasColumn("users", "resetPasswordOtp");
        if (!hasOtpCol) {
            await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetPasswordOtp\` varchar(255) NULL`);
        }
        const hasExpiryCol = await queryRunner.hasColumn("users", "resetPasswordOtpExpiry");
        if (!hasExpiryCol) {
            await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetPasswordOtpExpiry\` datetime NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasExpiryCol = await queryRunner.hasColumn("users", "resetPasswordOtpExpiry");
        if (hasExpiryCol) {
            await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetPasswordOtpExpiry\``);
        }
        const hasOtpCol = await queryRunner.hasColumn("users", "resetPasswordOtp");
        if (hasOtpCol) {
            await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetPasswordOtp\``);
        }
    }
}

