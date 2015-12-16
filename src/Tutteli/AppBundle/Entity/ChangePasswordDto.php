<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */

namespace Tutteli\AppBundle\Entity;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\Validator\Constraints as SecurityAssert;

class ChangePasswordDto {
    /**
     * @SecurityAssert\UserPassword(message = "password.notCurrent")
     */
    public $oldPw;
    
    /**
     * @Assert\Regex(pattern="/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{7,}/", message="login.password")
     */
    public $newPw;
    
    public $repeatPw;
    
    /**
     * @Assert\True(message = "password.notSame")
     */
    public function isPasswordLegal()
    {
        return ($this->newPw == $this->repeatPw);
    }
}