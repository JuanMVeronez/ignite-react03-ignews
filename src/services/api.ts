import axios from "axios";

export const api = axios.create({
  baseURL: '/api' // quando é usado somente esse / ele aproveita a url da aplicação
})