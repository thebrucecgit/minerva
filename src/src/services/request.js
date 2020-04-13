import axios from "axios";

const ENDPOINT = process.env.REACT_APP_ENDPOINT;

const instance = axios.create({
  baseURL: ENDPOINT
});

export default instance;
