export declare const api: import("axios").AxiosInstance;
export declare const authApi: {
    login: (email: string, password: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    register: (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        companyName: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    me: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    logout: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    forgotPassword: (email: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    resetPassword: (token: string, password: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const risksApi: {
    list: (params?: {
        status?: string;
        severity?: string;
        module?: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    get: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: string, data: {
        status?: string;
        notes?: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getHistory: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getDashboard: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const usersApi: {
    list: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    get: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: {
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: string, data: Partial<{
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    }>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const modulesApi: {
    list: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    get: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    enable: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    disable: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    configure: (id: string, config: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const auditApi: {
    list: (params?: {
        entity_type?: string;
        entity_id?: string;
        from?: string;
        to?: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    get: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    verify: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const tenantApi: {
    get: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (data: {
        name?: string;
        settings?: Record<string, unknown>;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getStats: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
//# sourceMappingURL=api.d.ts.map