<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160625105406 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE accounting (id INT AUTO_INCREMENT NOT NULL, updated_by_user INT NOT NULL, month DATE NOT NULL, reopened TINYINT(1) NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_6DC501E5A7F6CB27 (updated_by_user), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE accounting ADD CONSTRAINT FK_6DC501E5A7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
        $this->addSql('ALTER TABLE bill DROP FOREIGN KEY FK_EC224CAA768A6507');
        $this->addSql('ALTER TABLE bill DROP FOREIGN KEY FK_EC224CAAA7F6CB27');
        $this->addSql('ALTER TABLE bill DROP FOREIGN KEY FK_EC224CAAB0A3618F');
        $this->addSql('DROP INDEX idx_ec224caab0a3618f ON bill');
        $this->addSql('CREATE INDEX IDX_7A2119E3B0A3618F ON bill (user_debtor_id)');
        $this->addSql('DROP INDEX idx_ec224caa768a6507 ON bill');
        $this->addSql('CREATE INDEX IDX_7A2119E3768A6507 ON bill (user_creditor_id)');
        $this->addSql('DROP INDEX idx_ec224caaa7f6cb27 ON bill');
        $this->addSql('CREATE INDEX IDX_7A2119E3A7F6CB27 ON bill (updated_by_user)');
        $this->addSql('ALTER TABLE bill ADD CONSTRAINT FK_EC224CAA768A6507 FOREIGN KEY (user_creditor_id) REFERENCES app_users (id)');
        $this->addSql('ALTER TABLE bill ADD CONSTRAINT FK_EC224CAAA7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
        $this->addSql('ALTER TABLE bill ADD CONSTRAINT FK_EC224CAAB0A3618F FOREIGN KEY (user_debtor_id) REFERENCES app_users (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE accounting');
        $this->addSql('ALTER TABLE bill DROP FOREIGN KEY FK_7A2119E3B0A3618F');
        $this->addSql('ALTER TABLE bill DROP FOREIGN KEY FK_7A2119E3768A6507');
        $this->addSql('ALTER TABLE bill DROP FOREIGN KEY FK_7A2119E3A7F6CB27');
        $this->addSql('DROP INDEX idx_7a2119e3b0a3618f ON bill');
        $this->addSql('CREATE INDEX IDX_EC224CAAB0A3618F ON bill (user_debtor_id)');
        $this->addSql('DROP INDEX idx_7a2119e3768a6507 ON bill');
        $this->addSql('CREATE INDEX IDX_EC224CAA768A6507 ON bill (user_creditor_id)');
        $this->addSql('DROP INDEX idx_7a2119e3a7f6cb27 ON bill');
        $this->addSql('CREATE INDEX IDX_EC224CAAA7F6CB27 ON bill (updated_by_user)');
        $this->addSql('ALTER TABLE bill ADD CONSTRAINT FK_7A2119E3B0A3618F FOREIGN KEY (user_debtor_id) REFERENCES app_users (id)');
        $this->addSql('ALTER TABLE bill ADD CONSTRAINT FK_7A2119E3768A6507 FOREIGN KEY (user_creditor_id) REFERENCES app_users (id)');
        $this->addSql('ALTER TABLE bill ADD CONSTRAINT FK_7A2119E3A7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
    }
}
