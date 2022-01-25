
export function isArraysEqual(a,b) {
    if(a.length!==b.length) {
        return false;
    }
    else {
        for(let i=0;i<a.length;i++) {
            if(!compareObjects(a[i],b[i])) {
                return false;
            }
        }
        return true;
    }
}

export function compareObjects(o,p) {
    let keysO = Object.keys(o).sort();
    let keysP = Object.keys(p).sort();

    if(keysO.length!==keysP.length) {
        return false;
    }

    if(keysO.join('')!==keysP.join('')) {
        return false;
    }

    for(let i=0;i<keysO.length;i++) {
        if(o[keysO[i]] instanceof Array) {
            if(!p[keysO[i]] instanceof Array) {
                return false;
            }
            if(!compareObjects(o[keysO[i]],p[keysO[i]])) {
                return false;
            }
        }
        else if(o[keysO[i]] instanceof Date) {
            if(!(p[keysO[i]] instanceof Date)) {
                return false;
            }
            if(o[keysO[i]]!==p[keysO[i]]) {
                return false;
            }
        }
        else if(o[keysO[i]] instanceof Function) {
            if(!(p[keysO[i]] instanceof Function)) {
                return false;
            }
        }
        else if(o[keysO[i]] instanceof Object) {
            if(!(p[keysO[i]] instanceof Object)) {
                return false;
            }
            if(o[keysO[i]]===o) {
                if(p[keysO[i]]!==p) {
                    return false;
                }
            }
            else if(!compareObjects(o[keysO[i]],p[keysO[i]])) {
                return false;
            }
        }
        if(o[keysO[i]]!==p[keysO[i]]) {
            return false;
        }
    }
    return true;
}