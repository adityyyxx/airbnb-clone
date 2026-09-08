module.exports = (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
        const isAjax = req.xhr || 
                       req.headers.accept?.includes('application/json') || 
                       req.headers['content-type']?.includes('application/json');
        if (isAjax) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required', 
                redirect: '/login' 
            });
        }
        return res.redirect('/login');
    }
    next();
};
