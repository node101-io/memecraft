export async function GET(req: Request) {
  console.log("Hello World");

  return new Response("Hello World");
};

export async function POST(req: Request) {
  const body = await req.json();

  console.log(body);

  return new Response("Hello World");
};
