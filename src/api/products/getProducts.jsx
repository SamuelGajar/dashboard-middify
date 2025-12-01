import { useEffect, useState } from "react";

const API_URL = "https://957chi25kf.execute-api.us-east-2.amazonaws.com/dev/products";

export const getProducts = async ({ token, signal } = {}) => {
    const headers = {};
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API_URL, {
        headers,
        signal,
    });

    const result = await response.json();
    return result;
};

export const useProducts = (token) => {
    const [products, setProducts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        let isMounted = true;

        const loadProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getProducts({
                    token,
                    signal: controller.signal,
                });
                if (isMounted) {
                    setProducts(data);
                }
            } catch (err) {
                if (err.name === "AbortError") {
                    return;
                }
                if (isMounted) {
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [token]);

    return { products, loading, error };
};
