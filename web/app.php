<?php

use Symfony\Component\ClassLoader\ApcClassLoader;
use Symfony\Component\HttpFoundation\Request;

if ($_SERVER['HTTP_HOST'] != 'localhost') {
    $appDir = __DIR__.'/../../private/puma/app/';
} else {
    $appDir = __DIR__.'/../app/';
}
    

$loader = require_once $appDir.'bootstrap.php.cache';

// Enable APC for autoloading to improve performance.
// You should change the ApcClassLoader first argument to a unique prefix
// in order to prevent cache key conflicts with other applications
// also using APC.
/*
$apcLoader = new ApcClassLoader(sha1(__FILE__), $loader);
$loader->unregister();
$apcLoader->register(true);
*/

require_once $appDir.'AppKernel.php';
//require_once  $appDir.'AppCache.php';
if ($_SERVER['HTTP_HOST'] == 'tutteli.ch') {
    $kernel = new AppKernel('prod', false);
} else if ($_SERVER['HTTP_HOST'] == 'test.tutteli.ch') {
    $kernel = new AppKernel('test', false);
} else {
    $kernel = new AppKernel('pre_prod', false);
}

$kernel->loadClassCache();
//$kernel = new AppCache($kernel);

// When using the HttpCache, you need to call the method in your front controller instead of relying on the configuration parameter
//Request::enableHttpMethodParameterOverride();
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
