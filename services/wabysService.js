const wabysRepository = require("../repositories/wabysRepository");

exports.getAuthoritiesData = async () => {
    return await wabysRepository.fetchAllAuthorityData();
};