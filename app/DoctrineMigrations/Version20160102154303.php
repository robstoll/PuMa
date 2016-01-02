<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20160102154303 extends AbstractMigration
{
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE category ADD updated_by_user INT NOT NULL');
        $this->addSql('UPDATE category SET updated_by_user=\'1\'');
        $this->addSql('ALTER TABLE category ADD CONSTRAINT FK_64C19C1A7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
        $this->addSql('CREATE INDEX IDX_64C19C1A7F6CB27 ON category (updated_by_user)');
        $this->addSql('ALTER TABLE purchase ADD updated_by_user INT NOT NULL');
        $this->addSql('UPDATE purchase SET updated_by_user=\'1\'');
        $this->addSql('ALTER TABLE purchase ADD CONSTRAINT FK_6117D13BA7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
        $this->addSql('CREATE INDEX IDX_6117D13BA7F6CB27 ON purchase (updated_by_user)');
        $this->addSql('ALTER TABLE purchase_position ADD updated_by_user INT NOT NULL');
        $this->addSql('UPDATE purchase_position SET updated_by_user=\'1\'');
        $this->addSql('ALTER TABLE purchase_position ADD CONSTRAINT FK_6FEEF7A7A7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
        $this->addSql('CREATE INDEX IDX_6FEEF7A7A7F6CB27 ON purchase_position (updated_by_user)');
        $this->addSql('ALTER TABLE app_users ADD updated_by_user INT NOT NULL');
        $this->addSql('UPDATE app_users SET updated_by_user=\'1\'');
        $this->addSql('ALTER TABLE app_users ADD CONSTRAINT FK_C2502824A7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
        $this->addSql('CREATE INDEX IDX_C2502824A7F6CB27 ON app_users (updated_by_user)');
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE app_users DROP FOREIGN KEY FK_C2502824A7F6CB27');
        $this->addSql('DROP INDEX IDX_C2502824A7F6CB27 ON app_users');
        $this->addSql('ALTER TABLE app_users DROP updated_by_user');
        $this->addSql('ALTER TABLE category DROP FOREIGN KEY FK_64C19C1A7F6CB27');
        $this->addSql('DROP INDEX IDX_64C19C1A7F6CB27 ON category');
        $this->addSql('ALTER TABLE category DROP updated_by_user');
        $this->addSql('ALTER TABLE purchase DROP FOREIGN KEY FK_6117D13BA7F6CB27');
        $this->addSql('DROP INDEX IDX_6117D13BA7F6CB27 ON purchase');
        $this->addSql('ALTER TABLE purchase DROP updated_by_user');
        $this->addSql('ALTER TABLE purchase_position DROP FOREIGN KEY FK_6FEEF7A7A7F6CB27');
        $this->addSql('DROP INDEX IDX_6FEEF7A7A7F6CB27 ON purchase_position');
        $this->addSql('ALTER TABLE purchase_position DROP updated_by_user');
    }
}
