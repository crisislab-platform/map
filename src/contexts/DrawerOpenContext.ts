import { createContext } from "react";

export const DrawerOpenContext = createContext<{
	drawerOpen: boolean;
	setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ drawerOpen: false, setDrawerOpen: () => {} });
