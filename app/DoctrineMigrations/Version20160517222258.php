<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160517222258 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE billing (id INT AUTO_INCREMENT NOT NULL, user_debtor_id INT NOT NULL, user_creditor_id INT NOT NULL, updated_by_user INT NOT NULL, month DATE NOT NULL, amount VARBINARY(255) NOT NULL, payed TINYINT(1) NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_EC224CAAB0A3618F (user_debtor_id), INDEX IDX_EC224CAA768A6507 (user_creditor_id), INDEX IDX_EC224CAAA7F6CB27 (updated_by_user), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE billing ADD CONSTRAINT FK_EC224CAAB0A3618F FOREIGN KEY (user_debtor_id) REFERENCES app_users (id)');
        $this->addSql('ALTER TABLE billing ADD CONSTRAINT FK_EC224CAA768A6507 FOREIGN KEY (user_creditor_id) REFERENCES app_users (id)');
        $this->addSql('ALTER TABLE billing ADD CONSTRAINT FK_EC224CAAA7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE billing');
    }
}
