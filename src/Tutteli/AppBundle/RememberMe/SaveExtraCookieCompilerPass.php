<?php

/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\RememberMe;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class SaveExtraCookieCompilerPass implements CompilerPassInterface
{
    
    public function process(ContainerBuilder $container) {
        $definition = $container->getDefinition('security.authentication.rememberme.services.simplehash');
        $definition->addArgument($container->getParameter('salt_key'));
        $definition->setClass('Tutteli\AppBundle\RememberMe\SaveExtraCookie');        
    }
}
