export const formatCurrency = (amount, currency = 'LKR') => {
    if (amount === undefined || amount === null) return `${currency} 0.00`;
    const formatted = Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${currency} ${formatted}`;
};