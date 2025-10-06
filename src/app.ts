import "./db/schema";
import { AuthService } from "./utils/auth";
import { showMainMenu } from "./utils/menu";

async function main() {
    console.log("✈️   Sistema Aerocode - Login");
    const user = await AuthService.login();
    if (!user) {
        process.exit(1);
    }
    await showMainMenu(user);
}

main().catch(console.error);