import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";


export default function Home() {
  return (
    <div className="min-h-dvh pt-16 bg-gradient-to-b from-zinc-900 to-black flex flex-col items-center justify-center text-white px-2">
      <div className="text-center mb-5">
        <h1 className="text-lg md:text-xl font-mono font-bold">Log the books you’ve read.</h1>
        <h2 className="text-lg md:text-xl font-mono font-bold">Save the ones you’re excited for.</h2>
        <h3 className="text-lg md:text-xl font-mono font-bold">Share your must-reads.</h3>
      </div>

      <Button className="bg-white text-black font-mono font-bold px-6 py-2 rounded-md mb-4 hover:bg-gray-200 transition">
        Get started !
      </Button>

      <p className="text-xs text-gray-400 font-mono mt-2">
        Social network for your fav books
      </p>

      <div className="mt-16 text-left w-full max-w-4xl">
        <p className="text-xs font-mono mb-2">RISUTO LETS YOU</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="h-24" />
          </Card>
          <Card>
            <CardContent className="h-24" />
          </Card>
          <Card>
            <CardContent className="h-24" />
          </Card>
        </div>
      </div>
    </div>
  );
}
