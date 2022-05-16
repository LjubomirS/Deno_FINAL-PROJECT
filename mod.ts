import { Application, send } from "https://deno.land/x/oak@v10.5.1/mod.ts";
import api from "./api.ts";
import { join } from "https://deno.land/std@0.139.0/path/mod.ts"


const app = new Application();
const PORT = 8000;

app.use(async (ctx,next)=>{
    await next();
    const time = ctx.response.headers.get("X-Response-Time");
    console.log(`${ctx.request.method} ${ctx.request.url}: ${time}`);
})

app.use( async (ctx, next)=>{
    const start = Date.now();
    await next();
    const delta = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${delta} ms`);
})

app.use(api.routes());
app.use(api.allowedMethods());

app.use(async(ctx)=>{
    const fileWhitelist = [
        "/index.html",
        "/images/favicon.png",
        "/javascripts/script.js",
        "/stylesheets/style.css",
    ]
    const filePath = ctx.request.url.pathname;
    
    if(fileWhitelist.includes(filePath)){
        await send(ctx,filePath,{
            root:`${Deno.cwd()}/public`,
        });
    }
});


if(import.meta.main){
   await app.listen({
        port:PORT,
    })
}