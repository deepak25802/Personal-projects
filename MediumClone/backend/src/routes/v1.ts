import { Hono } from "hono";
import users from "./users";
import blogs from "./blogs";

const v1 = new Hono();

v1.route('/users', users);
v1.route('/blogs', blogs);

export default v1;