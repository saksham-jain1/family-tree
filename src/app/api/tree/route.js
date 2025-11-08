// src/app/api/tree/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect"; //
import Tree from "../../../models/Tree"; //
import { verifyIdToken } from "../../../lib/firebaseAdmin";

/**
 * Gets the authenticated user's ID token from the Authorization header.
 * @returns {Promise<string | null>}
 */
const getAuthToken = async (request) => {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split("Bearer ")[1];
};

/**
 * GET: Fetch the user's family tree
 */
export async function GET(request) {
  try {
    const token = await getAuthToken(request);
    const user = await verifyIdToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const tree = await Tree.findOne({ ownerUid: user.uid });

    if (!tree) {
      return NextResponse.json({ tree: null }, { status: 200 });
    }

    return NextResponse.json({ tree }, { status: 200 });
  } catch (error) {
    console.error("GET /api/tree error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create or update a user's family tree
 */
export async function POST(request) {
  try {
    const token = await getAuthToken(request);
    const user = await verifyIdToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { treeData } = await request.json();

    if (!treeData) {
      return NextResponse.json({ error: "Missing treeData" }, { status: 400 });
    }

    await dbConnect();

    const updatedTree = await Tree.findOneAndUpdate(
      { ownerUid: user.uid },
      {
        ownerUid: user.uid,
        ownerEmail: user.email,
        treeData: treeData,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ tree: updatedTree }, { status: 200 });
  } catch (error) {
    console.error("POST /api/tree error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete a user's family tree
 */
export async function DELETE(request) {
  try {
    const token = await getAuthToken(request);
    const user = await verifyIdToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    await Tree.deleteOne({ ownerUid: user.uid });

    return NextResponse.json({ message: "Tree deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/tree error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
