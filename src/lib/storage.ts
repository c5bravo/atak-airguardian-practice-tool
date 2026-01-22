import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import { PeopleList } from "./types";

export const storage = createStorage<PeopleList & { time: number }>({
  driver: memoryDriver(),
});
