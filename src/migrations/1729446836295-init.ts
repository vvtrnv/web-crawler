import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1729446836295 implements MigrationInterface {
    name = 'Init1729446836295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "UrlList" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, CONSTRAINT "PK_54a75b3d39052df198c4d21c94d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "LinkBetweenUrl" ("id" SERIAL NOT NULL, "fromUrlId" integer, "toUrlId" integer, CONSTRAINT "PK_e2c324ad1ad52139816efb41c9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "WordList" ("id" SERIAL NOT NULL, "word" character varying NOT NULL, "isFiltered" boolean NOT NULL, CONSTRAINT "PK_1aea7549b88cf0cb56e16ef9389" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "LinkWord" ("id" SERIAL NOT NULL, "wordId" integer, "linkId" integer, CONSTRAINT "PK_d76a1516d3e20ca9dbdde226f60" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "WordLocation" ("id" SERIAL NOT NULL, "location" integer NOT NULL, "wordId" integer, "urlId" integer, CONSTRAINT "PK_f72b3f705ea8bc446c5461ff250" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "LinkBetweenUrl" ADD CONSTRAINT "FK_6398f761c50d9388f0f3e291616" FOREIGN KEY ("fromUrlId") REFERENCES "UrlList"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "LinkBetweenUrl" ADD CONSTRAINT "FK_c1f75b40eb773146cffef14df75" FOREIGN KEY ("toUrlId") REFERENCES "UrlList"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "LinkWord" ADD CONSTRAINT "FK_3a727a2998047c0ed8a73ae566f" FOREIGN KEY ("wordId") REFERENCES "WordList"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "LinkWord" ADD CONSTRAINT "FK_7eb815e5bb3ee504b9089ce2618" FOREIGN KEY ("linkId") REFERENCES "LinkBetweenUrl"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "WordLocation" ADD CONSTRAINT "FK_450dff1ed5bbe5f64116d9ac278" FOREIGN KEY ("wordId") REFERENCES "WordList"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "WordLocation" ADD CONSTRAINT "FK_8f8fec20c9a19f56bdaba540158" FOREIGN KEY ("urlId") REFERENCES "UrlList"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "WordLocation" DROP CONSTRAINT "FK_8f8fec20c9a19f56bdaba540158"`);
        await queryRunner.query(`ALTER TABLE "WordLocation" DROP CONSTRAINT "FK_450dff1ed5bbe5f64116d9ac278"`);
        await queryRunner.query(`ALTER TABLE "LinkWord" DROP CONSTRAINT "FK_7eb815e5bb3ee504b9089ce2618"`);
        await queryRunner.query(`ALTER TABLE "LinkWord" DROP CONSTRAINT "FK_3a727a2998047c0ed8a73ae566f"`);
        await queryRunner.query(`ALTER TABLE "LinkBetweenUrl" DROP CONSTRAINT "FK_c1f75b40eb773146cffef14df75"`);
        await queryRunner.query(`ALTER TABLE "LinkBetweenUrl" DROP CONSTRAINT "FK_6398f761c50d9388f0f3e291616"`);
        await queryRunner.query(`DROP TABLE "WordLocation"`);
        await queryRunner.query(`DROP TABLE "LinkWord"`);
        await queryRunner.query(`DROP TABLE "WordList"`);
        await queryRunner.query(`DROP TABLE "LinkBetweenUrl"`);
        await queryRunner.query(`DROP TABLE "UrlList"`);
    }

}
