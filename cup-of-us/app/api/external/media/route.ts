import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { mediaPairings } from "../../../../db/schema";

type RuntimeEnv={SPOTIFY_CLIENT_ID?:string;SPOTIFY_CLIENT_SECRET?:string;TMDB_API_KEY?:string};

export async function GET(request:Request){
  const slug=new URL(request.url).searchParams.get("slug");
  if(!slug)return Response.json({error:"slug required"},{status:400});
  const pair=(await getDb().select().from(mediaPairings).where(eq(mediaPairings.bookSlug,slug)).limit(1))[0];
  if(!pair)return Response.json({pairing:null});
  const runtime=env as unknown as RuntimeEnv;
  let spotify:unknown=null;let movie:unknown=null;
  if(runtime.SPOTIFY_CLIENT_ID&&runtime.SPOTIFY_CLIENT_SECRET){try{
    const credentials=btoa(`${runtime.SPOTIFY_CLIENT_ID}:${runtime.SPOTIFY_CLIENT_SECRET}`);
    const tokenResponse=await fetch("https://accounts.spotify.com/api/token",{method:"POST",headers:{authorization:`Basic ${credentials}`,"content-type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials"});
    const token=await tokenResponse.json() as {access_token?:string};
    if(token.access_token){
      const q=encodeURIComponent(`track:${pair.songTitle} artist:${pair.songArtist}`);
      const search=await fetch(`https://api.spotify.com/v1/search?type=track&limit=5&q=${q}`,{headers:{authorization:`Bearer ${token.access_token}`}});
      const data=await search.json() as {tracks?:{items?:Array<{id:string;name:string;artists:{name:string}[];external_urls:{spotify:string}}>} };
      const exact=data.tracks?.items?.find(x=>x.name.toLowerCase()===pair.songTitle.toLowerCase())??data.tracks?.items?.[0];
      if(exact)spotify={...exact,embedUrl:`https://open.spotify.com/embed/track/${exact.id}`};
    }
  }catch{spotify=null}}
  if(runtime.TMDB_API_KEY){try{
    const response=await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${runtime.TMDB_API_KEY}&query=${encodeURIComponent(pair.movieTitle)}&year=${pair.movieYear??""}`);
    const data=await response.json() as {results?:unknown[]};movie=data.results?.[0]??null;
  }catch{movie=null}}
  return Response.json({pairing:pair,spotify,movie,integrations:{spotify:Boolean(runtime.SPOTIFY_CLIENT_ID&&runtime.SPOTIFY_CLIENT_SECRET),tmdb:Boolean(runtime.TMDB_API_KEY),originalAudio:true,audioSummary:true}});
}
