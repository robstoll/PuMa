<?php

/*
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
namespace Tutteli\AppBundle\Handler;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\DefaultAuthenticationSuccessHandler;
use Symfony\Component\Security\Http\HttpUtils;
use Defuse\Crypto\Crypto;
use Defuse\Crypto\Key;
use Tutteli\AppBundle\Entity\User;
use Symfony\Component\HttpFoundation\File\Exception\AccessDeniedException;

class AuthSuccessHandler extends DefaultAuthenticationSuccessHandler 
{
    const PAGE_BEFORE_LOGIN = '_security.secured_area.target_path';
    const SESSION_KEY_DATA_KEY = '_tutteli.puma.dataKey';
    private $saltKey;
    
    public function __construct($saltKey, HttpUtils $httpUtils, array $options) {
        parent::__construct($httpUtils, $options);
        $this->saltKey = base64_decode($saltKey);
    }
    
    public function onAuthenticationSuccess(Request $request, TokenInterface $token) {
        try {
            $password = $request->get('password');
            $user = $token->getUser();
            AuthSuccessHandler::encryptDataKeyAndPutIntoSession($request, $user, $password, $this->saltKey);
        } catch(Exception $e) {
            $request->getSession()->invalidate();
            throw new AccessDeniedException("Unexpected exception occurred.");
        }
           
        if ($request->isXmlHttpRequest()) {
            $redirectUrl = $request->getSession()->get('_security.main.target_path');
            return new Response(
                    '{'
                       .'"user": {'
                       .'"id":"'.$user->getId().'",'
                       .'"role":"'.$user->getRole().'",'
                       .'"username":"'.$user->getUserName().'",'
                       .'"isReal":"'.($user->isReal() ? '1':'0').'"'
                       .'},' 
                       .'"url":"'.$redirectUrl.'"'
                    .'}');
        }
        return parent::onAuthenticationSuccess($request, $token);
    }
    
    public static function encryptDataKeyAndPutIntoSession(Request $request, User $user, $password, $salt) {
        $key = Key::CreateKeyBasedOnPassword($password, $salt);
        $encryptedKey = $user->getDataKey();
        $asciiDataKey = Crypto::decrypt($encryptedKey, $key, true);
        $dataKey = Key::LoadFromAsciiSafeString($asciiDataKey);
        $request->getSession()->set(AuthSuccessHandler::SESSION_KEY_DATA_KEY, $dataKey);
        return $dataKey;
    }
}
