function focusOrScrollTo(element) {
    function findPos(obj) {
        var curtop = 0;
        if (obj.offsetParent) {
                do {
                curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
        }
        return curtop;
    }
    
    function isNotOnScreen(position) {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        return !(scrollTop < position && position < scrollTop + window.innerHeight);
    }
        
    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (width > 768) {
        element.focus();
    } else {
        var pos = findPos(element);
        if (isNotOnScreen(pos)) {
            //nav's height is 50 + 20 margin bottom 
            window.scroll(0,  pos - 70);
        }
    }
}