import { neon } from "@neondatabase/serverless";

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { ride_id, status } = body;

        if (!ride_id || !status) {
            return Response.json(
                { error: "Missing required fields: ride_id or status" },
                { status: 400 }
            );
        }

        const sql = neon(`${process.env.DATABASE_URL}`);
        // console.log(`DATABASE_URL: ${process.env.DATABASE_URL}`);
        // console.log(`ride_id:: ${ride_id}`);
        // console.log(`status:: ${status}`);
        const response = await sql`
        UPDATE rides
        SET status = ${status}
        WHERE ride_id = ${ride_id}
        RETURNING *;
        `;

        if (response.length === 0) {
            return Response.json(
                { error: "Ride not found or no changes made" },
                { status: 404 }
            );
        }

        return Response.json({ data: response[0] }, { status: 200 });
    } catch (error) {
        console.error("Error updating ride status:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}