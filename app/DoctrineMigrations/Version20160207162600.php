<?php

namespace Application\Migrations;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Defuse\Crypto\Crypto;
use Defuse\Crypto\Key;
use Doctrine\DBAL\Migrations\AbortMigrationException;

class Version20160207162600 extends AbstractMigration implements ContainerAwareInterface
{
    /**
     * @var \Symfony\Component\DependencyInjection\ContainerInterface
     */
    private $container;
    
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }
    
    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');
        
        $password = 'tutteli-puma';
        $hash = password_hash($password, PASSWORD_BCRYPT);
        
        $salt = base64_decode($this->container->getParameter('salt_key'));
        if (\strlen($salt) < Key::MIN_SAFE_KEY_BYTE_SIZE) {
            $suggestedSalt = base64_encode(openssl_random_pseudo_bytes(Key::MIN_SAFE_KEY_BYTE_SIZE * 2));
            throw new AbortMigrationException('You need to define an own salt_key in your parameters.yml file which is at least '.Key::MIN_SAFE_KEY_BYTE_SIZE.' characters long.'."\n"
                    .'Following a randomly created key:'."\n"
                    .'salt_key: '.$suggestedSalt);
        }
        
        $dataKey = null;
        if ($this->container->hasParameter('data_key_delete_after_migration')) {
            $asciiDataKey = $this->container->getParameter('data_key_delete_after_migration');
            $dataKey = Key::LoadFromAsciiSafeString($asciiDataKey);
        }
        if ($dataKey == null) {
            throw new AbortMigrationException('You need to define an own data_key_delete_after_migration in your parameters.yml which is a key generated with \Defuse\Crypto\Key::CreateNewRandomKey()->saveToAsciiSafeString()'."\n"
                    .'Following a randomly created key:'."\n"
                    .'data_key_delete_after_migration: '.Key::CreateNewRandomKey()->saveToAsciiSafeString()."\n"
                    .'YOU MUST delete this entry in your parameters.yml afterwards (you can make a copy on a save device).');
        }
        
        $key = Key::CreateKeyBasedOnPassword($password, $salt);
        $encryptedDataKey = Crypto::encrypt($asciiDataKey, $key, true);
        
        $this->addSql('CREATE TABLE category (id INT AUTO_INCREMENT NOT NULL, name VARBINARY(255) NOT NULL, updated_by_user INT NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_64C19C15E237E06 (name), INDEX IDX_64C19C1A7F6CB27 (updated_by_user), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE purchase (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, purchase_date DATE NOT NULL, total VARBINARY(255) NOT NULL, updated_by_user INT NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_6117D13BA76ED395 (user_id), INDEX IDX_6117D13BA7F6CB27 (updated_by_user), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE purchase_position (id INT AUTO_INCREMENT NOT NULL, purchase_id INT NOT NULL, category_id INT NOT NULL, expression LONGBLOB NOT NULL, price VARBINARY(255) NOT NULL, notice LONGBLOB NULL, updated_by_user INT NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_6FEEF7A712469DE2 (category_id), INDEX IDX_6FEEF7A7558FBEB9 (purchase_id), INDEX IDX_6FEEF7A7A7F6CB27 (updated_by_user), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('CREATE TABLE app_users (id INT AUTO_INCREMENT NOT NULL, username VARCHAR(25) NOT NULL, password VARCHAR(64) NOT NULL, email VARCHAR(60) NOT NULL, role VARCHAR(20) DEFAULT NULL, data_key VARBINARY(255) NOT NULL, updated_by_user INT NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_C2502824F85E0677 (username), UNIQUE INDEX UNIQ_C2502824E7927C74 (email), INDEX IDX_C2502824A7F6CB27 (updated_by_user), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci ENGINE = InnoDB');
        $this->addSql('ALTER TABLE category ADD CONSTRAINT FK_64C19C1A7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
        $this->addSql('ALTER TABLE purchase ADD CONSTRAINT FK_6117D13BA76ED395 FOREIGN KEY (user_id) REFERENCES app_users (id)');
        $this->addSql('ALTER TABLE purchase ADD CONSTRAINT FK_6117D13BA7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
        $this->addSql('ALTER TABLE purchase_position ADD CONSTRAINT FK_6FEEF7A712469DE2 FOREIGN KEY (category_id) REFERENCES category (id)');
        $this->addSql('ALTER TABLE purchase_position ADD CONSTRAINT FK_6FEEF7A7558FBEB9 FOREIGN KEY (purchase_id) REFERENCES purchase (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE purchase_position ADD CONSTRAINT FK_6FEEF7A7A7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
        $this->addSql('ALTER TABLE app_users ADD CONSTRAINT FK_C2502824A7F6CB27 FOREIGN KEY (updated_by_user) REFERENCES app_users (id)');
        
        $now = date('Y-m-d\\TH:i:s', time());
        $this->addSql('INSERT INTO app_users (username, password, role, data_key, updated_by_user, updated_at) '
                .'VALUES (\'admin\', :password, \'ROLE_ADMIN\', :data_key, \'1\', :updated_at)',
                array('password' => $hash, 'data_key' => $encryptedDataKey, 'updated_at'=> $now));
        
        $this->addSql('INSERT INTO category (name, updated_by_user, updated_at) '
                .'VALUES (:name, \'1\', :updated_at)', 
                array('name' => Crypto::encrypt('Lebensmittel', $dataKey, true), 'updated_at'=> $now));
    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() != 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE purchase_position DROP FOREIGN KEY FK_6FEEF7A712469DE2');
        $this->addSql('ALTER TABLE purchase_position DROP FOREIGN KEY FK_6FEEF7A7558FBEB9');
        $this->addSql('ALTER TABLE category DROP FOREIGN KEY FK_64C19C1A7F6CB27');
        $this->addSql('ALTER TABLE purchase DROP FOREIGN KEY FK_6117D13BA76ED395');
        $this->addSql('ALTER TABLE purchase DROP FOREIGN KEY FK_6117D13BA7F6CB27');
        $this->addSql('ALTER TABLE purchase_position DROP FOREIGN KEY FK_6FEEF7A7A7F6CB27');
        $this->addSql('ALTER TABLE app_users DROP FOREIGN KEY FK_C2502824A7F6CB27');
        $this->addSql('DROP TABLE category');
        $this->addSql('DROP TABLE purchase');
        $this->addSql('DROP TABLE purchase_position');
        $this->addSql('DROP TABLE app_users');
    }
}
