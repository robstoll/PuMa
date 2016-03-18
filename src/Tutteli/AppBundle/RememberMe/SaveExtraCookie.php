<?php

/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\RememberMe;

use Symfony\Component\Security\Http\RememberMe\TokenBasedRememberMeServices;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Defuse\Crypto\Crypto;
use Tutteli\AppBundle\Handler\AuthSuccessHandler;
use Defuse\Crypto\Key;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\HttpFoundation\File\Exception\AccessDeniedException;
use Symfony\Component\HttpKernel\Log\LoggerInterface;
class SaveExtraCookie extends TokenBasedRememberMeServices 
{
    private $saltKey;

    public function __construct(array $userProviders, $key, $providerKey, array $options = array(), LoggerInterface $logger = null, $saltKey) {
        parent::__construct($userProviders, $key, $providerKey, $options, $logger);
        $this->saltKey = base64_decode($saltKey);
    }
    
    protected function processAutoLoginCookie(array $cookieParts, Request $request) {
        $user = parent::processAutoLoginCookie($cookieParts, $request);
        try {
            $hash = $cookieParts[3];
            $key = $this->createKey($hash);
            $cookieAppendum = $request->cookies->get($this->options['name'].'_A');
            $password = Crypto::decrypt($cookieAppendum, $key);
            AuthSuccessHandler::encryptDataKeyAndPutIntoSession($request, $user, $password, $this->saltKey);
        } catch(Exception $e) {
            throw new AuthenticationException("Unexpected exception occurred.");
        }
        return $user;
    }
    
    protected function onLoginSuccess(Request $request, Response $response, TokenInterface $token) {
        parent::onLoginSuccess($request, $response, $token);
        try {
            $password = $request->get('password');
            $cookie = $this->getCookie($response);
            $hash = $this->decodeCookie($cookie->getValue())[3];
            $key = $this->createKey($hash);
            $value = Crypto::encrypt($password, $key);
            $response->headers->setCookie(new Cookie(
                $this->options['name'].'_A',
                $value,
                $cookie->getExpiresTime(),
                $this->options['path'],
                $this->options['domain'],
                $this->options['secure'],
                $this->options['httponly']
            ));
        } catch(Exception $ex) {
            $request->getSession()->invalidate();
            throw new AccessDeniedException("Unexpected exception occurred.");
        }
    }
    
    /**
     * @return \Symfony\Component\HttpFoundation\Cookie 
     */
    private function getCookie(Response $response) {
        $cookie = null;
        foreach($response->headers->getCookies() as $tempCookie) {
            if ($tempCookie->getName() == $this->options['name']) {
                $cookie = $tempCookie;
                break;
            }
        }
        return $cookie;
    }
    /**
     * @return \Defuse\Crypto\Key
     */
    private function createKey($hash) {
        return Key::CreateKeyBasedOnPassword($hash, $this->saltKey);
    }

}

