import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1695566061762 implements MigrationInterface {
    name = 'Initial1695566061762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "UrlList" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "url" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "LinkBetweenUrl" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "fromUrlId" integer, "toUrlId" integer)`);
        await queryRunner.query(`CREATE TABLE "WordList" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "word" varchar NOT NULL, "isFiltered" boolean NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "LinkWord" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "wordId" integer, "linkId" integer)`);
        await queryRunner.query(`CREATE TABLE "WordLocation" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "location" integer NOT NULL, "wordId" integer, "urlId" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_LinkBetweenUrl" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "fromUrlId" integer, "toUrlId" integer, CONSTRAINT "FK_6398f761c50d9388f0f3e291616" FOREIGN KEY ("fromUrlId") REFERENCES "UrlList" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_c1f75b40eb773146cffef14df75" FOREIGN KEY ("toUrlId") REFERENCES "UrlList" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_LinkBetweenUrl"("id", "fromUrlId", "toUrlId") SELECT "id", "fromUrlId", "toUrlId" FROM "LinkBetweenUrl"`);
        await queryRunner.query(`DROP TABLE "LinkBetweenUrl"`);
        await queryRunner.query(`ALTER TABLE "temporary_LinkBetweenUrl" RENAME TO "LinkBetweenUrl"`);
        await queryRunner.query(`CREATE TABLE "temporary_LinkWord" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "wordId" integer, "linkId" integer, CONSTRAINT "FK_3a727a2998047c0ed8a73ae566f" FOREIGN KEY ("wordId") REFERENCES "WordList" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_7eb815e5bb3ee504b9089ce2618" FOREIGN KEY ("linkId") REFERENCES "LinkBetweenUrl" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_LinkWord"("id", "wordId", "linkId") SELECT "id", "wordId", "linkId" FROM "LinkWord"`);
        await queryRunner.query(`DROP TABLE "LinkWord"`);
        await queryRunner.query(`ALTER TABLE "temporary_LinkWord" RENAME TO "LinkWord"`);
        await queryRunner.query(`CREATE TABLE "temporary_WordLocation" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "location" integer NOT NULL, "wordId" integer, "urlId" integer, CONSTRAINT "FK_450dff1ed5bbe5f64116d9ac278" FOREIGN KEY ("wordId") REFERENCES "WordList" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_8f8fec20c9a19f56bdaba540158" FOREIGN KEY ("urlId") REFERENCES "UrlList" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
        await queryRunner.query(`INSERT INTO "temporary_WordLocation"("id", "location", "wordId", "urlId") SELECT "id", "location", "wordId", "urlId" FROM "WordLocation"`);
        await queryRunner.query(`DROP TABLE "WordLocation"`);
        await queryRunner.query(`ALTER TABLE "temporary_WordLocation" RENAME TO "WordLocation"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "WordLocation" RENAME TO "temporary_WordLocation"`);
        await queryRunner.query(`CREATE TABLE "WordLocation" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "location" integer NOT NULL, "wordId" integer, "urlId" integer)`);
        await queryRunner.query(`INSERT INTO "WordLocation"("id", "location", "wordId", "urlId") SELECT "id", "location", "wordId", "urlId" FROM "temporary_WordLocation"`);
        await queryRunner.query(`DROP TABLE "temporary_WordLocation"`);
        await queryRunner.query(`ALTER TABLE "LinkWord" RENAME TO "temporary_LinkWord"`);
        await queryRunner.query(`CREATE TABLE "LinkWord" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "wordId" integer, "linkId" integer)`);
        await queryRunner.query(`INSERT INTO "LinkWord"("id", "wordId", "linkId") SELECT "id", "wordId", "linkId" FROM "temporary_LinkWord"`);
        await queryRunner.query(`DROP TABLE "temporary_LinkWord"`);
        await queryRunner.query(`ALTER TABLE "LinkBetweenUrl" RENAME TO "temporary_LinkBetweenUrl"`);
        await queryRunner.query(`CREATE TABLE "LinkBetweenUrl" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "fromUrlId" integer, "toUrlId" integer)`);
        await queryRunner.query(`INSERT INTO "LinkBetweenUrl"("id", "fromUrlId", "toUrlId") SELECT "id", "fromUrlId", "toUrlId" FROM "temporary_LinkBetweenUrl"`);
        await queryRunner.query(`DROP TABLE "temporary_LinkBetweenUrl"`);
        await queryRunner.query(`DROP TABLE "WordLocation"`);
        await queryRunner.query(`DROP TABLE "LinkWord"`);
        await queryRunner.query(`DROP TABLE "WordList"`);
        await queryRunner.query(`DROP TABLE "LinkBetweenUrl"`);
        await queryRunner.query(`DROP TABLE "UrlList"`);
    }

}
