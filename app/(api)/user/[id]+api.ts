import {neon} from "@neondatabase/serverless";

export async function GET(request: Request, {id}: { id: string }) {
    if (!id)
        return Response.json({error: "Missing required fields"}, {status: 400});

    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const response = await sql`
        SELECT *
        FROM users
        WHERE users.clerk_id = ${id}
        `;
        // console.log(`GET::user: ${JSON.stringify(response)}`);
        // console.log(`GET::user: ${id}`);

        return Response.json({data: response[0]});
    } catch (error) {
        console.error("Error fetching recent user:", error);
        return Response.json({error: "Internal Server Error"}, {status: 500});
    }
}