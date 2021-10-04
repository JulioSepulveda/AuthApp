/* Todos los campos son opcionales excepto el ok ya que las respuestas correctas o fallidas son diferentes */
export interface AuthResponse {
    ok:boolean;
    uid?: string,
    name?: string;
    token?: string;
    msg?: string;
    email?: string
}

export interface Usuario {
    uid: string;
    name: string;
    email: string;
}