import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateUser() {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    let user = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id }
    });

    if (!user && email) {
        // Try to find by email first to link legacy accounts if any, otherwise create
        user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            // Link existing user
            user = await prisma.user.update({
                where: { id: user.id },
                data: { clerkId: clerkUser.id }
            });
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    clerkId: clerkUser.id,
                    email: email,
                }
            });
        }
    }

    return user;
}
