import bcrypt from "bcryptjs";
import { envVars } from "../config/env";
import { type IAuthProvider, type IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

export const seedAdmin = async () => {
    try {
        const isAdminExist = await User.findOne({ email: envVars.ADMIN_EMAIL })

        if (isAdminExist) {
            console.log("Admin Already Exists!");
            return;
        }

        console.log("Trying to create Admin...");

        const hashedPassword = await bcrypt.hash(envVars.ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND))

        const authProvider: IAuthProvider = {
            provider: "credentials",
            providerId: envVars.ADMIN_EMAIL
        }

        const payload: IUser = {
            name: "Admin",
            role: Role.ADMIN,
            email: envVars.ADMIN_EMAIL,
            password: hashedPassword,
            isVerified: true,
            auths: [authProvider]
        }

        const superadmin = await User.create(payload)
        console.log("Super Admin Created Successfuly! \n");
        console.log(superadmin);
    } catch (error) {
        console.log(error);
    }
}