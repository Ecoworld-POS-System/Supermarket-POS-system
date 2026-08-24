const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Lightweight API client with Axios-compatible interface for HTTP requests
 */
export const api = {
    async request(endpoint, options = {}) {
        const { params, responseType, headers = {}, ...customConfig } = options;

        let url = endpoint.startsWith('http') 
            ? endpoint 
            : `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

        if (params && Object.keys(params).length > 0) {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });
            const queryString = queryParams.toString();
            if (queryString) {
                url += `${url.includes('?') ? '&' : '?'}${queryString}`;
            }
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            ...customConfig,
        };

        if (
            config.body &&
            typeof config.body === 'object' &&
            !(config.body instanceof FormData) &&
            !(config.body instanceof Blob)
        ) {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(
                    errorData.message || `HTTP Error ${response.status}: ${response.statusText}`
                );
                error.response = {
                    status: response.status,
                    data: errorData,
                    statusText: response.statusText,
                };
                throw error;
            }

            let data;
            if (responseType === 'blob') {
                data = await response.blob();
            } else if (responseType === 'text') {
                data = await response.text();
            } else {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    try {
                        data = JSON.parse(text);
                    } catch {
                        data = text;
                    }
                }
            }

            return {
                data,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            };
        } catch (error) {
            console.error(`API Error on [${config.method || 'GET'}] ${url}:`, error);
            throw error;
        }
    },

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    },

    put(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    },

    patch(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    },

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    },
};

export default api;
