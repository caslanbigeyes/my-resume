import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
    try {
        const algorithms = await prisma.algorithm.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })
        return NextResponse.json(algorithms)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching algorithms' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const algorithm = await prisma.algorithm.create({
            data: {
                title: body.title,
                url: body.url,
                category: body.category,
                difficulty: body.difficulty
            }
        })
        return NextResponse.json(algorithm)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating algorithm' }, { status: 500 })
    }
}