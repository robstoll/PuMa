<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160102151305 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE category ADD created_at DATE NOT NULL, ADD updated_at DATE NOT NULL');
        $this->addSql('ALTER TABLE purchase ADD created_at DATE NOT NULL, ADD updated_at DATE NOT NULL');
        $this->addSql('ALTER TABLE purchase_position ADD created_at DATE NOT NULL, ADD updated_at DATE NOT NULL');
        $this->addSql('ALTER TABLE app_users ADD created_at DATE NOT NULL, ADD updated_at DATE NOT NULL');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE app_users DROP created_at, DROP updated_at');
        $this->addSql('ALTER TABLE category DROP created_at, DROP updated_at');
        $this->addSql('ALTER TABLE purchase DROP created_at, DROP updated_at');
        $this->addSql('ALTER TABLE purchase_position DROP created_at, DROP updated_at');
    }
}
