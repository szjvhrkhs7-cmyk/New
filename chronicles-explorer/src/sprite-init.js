const spriteData=(window.SPRITE_PARTS||[]).join('');
if(spriteData){document.documentElement.style.setProperty('--sprite-url',`url("data:image/webp;base64,${spriteData}")`);}
