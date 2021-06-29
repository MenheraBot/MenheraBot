const axios = require('axios');

const request = axios.create({
  baseURL: 'http://localhost:2080',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Menhera-Client',
  },
});

module.exports = class NewHttp {
  static async astolfoRequest(text) {
    let err = false;
    const data = await request.get('/astolfo', { data: { text } }).catch(() => { err = true; });
    const returnData = { err, data: data?.data };
    return returnData;
  }

  static async philoRequest(text) {
    let err = false;
    const data = await request.get('/philo', { data: { text } }).catch(() => { err = true; });
    const returnData = { err, data: data?.data };
    return returnData;
  }

  static async shipRequest(linkOne, linkTwo, shipValue) {
    let err = false;
    const data = await request.get('/ship', { data: { linkOne, linkTwo, shipValue } }).catch(() => { err = true; });
    const returnData = { err, data: data?.data };
    return returnData;
  }

  static async trisalRequest(userOne, userTwo, userThree) {
    let err = false;
    const data = await request.get('/trisal', { data: { userOne, userTwo, userThree } }).catch(() => { err = true; });
    const returnData = { err, data: data?.data };
    return returnData;
  }

  static async profileRequest(user, marry, usageCommands, i18n) {
    let err = false;
    const data = await request.get('/profile', {
      data: {
        user, marry, usageCommands, i18n,
      },
    }).catch(() => { err = true; });
    const returnData = { err, data: data?.data };
    return returnData;
  }

  static async statusRequest(user, userAvatarLink, i18n) {
    let err = false;
    const data = await request.get('/status', {
      data: { user, userAvatarLink, i18n },
    }).catch(() => { err = true; });
    const returnData = { err, data: data?.data };
    return returnData;
  }

  static async gadoRequest(image) {
    let err = false;
    const data = await request.get('/gado', { data: { image } }).catch(() => { err = true; });
    const returnData = { err, data: data?.data };
    return returnData;
  }

  static async macetavaRequest(image, authorName, authorDiscriminator, authorImage) {
    let err = false;
    const data = await request.get('/macetava', {
      data: {
        image, authorName, authorDiscriminator, authorImage,
      },
    }).catch(() => { err = true; });
    const returnData = { err, data: data?.data };
    return returnData;
  }

  static async blackjackRequest(aposta, userCards, menheraCards, userTotal, menheraTotal, isEnd, i18n) {
    let err = false;
    if (!isEnd) menheraCards[1].hidden = true;
    const data = await request.get('/blackjack', {
      data: {
        userCards, menheraCards, userTotal, menheraTotal, i18n, aposta,
      },
    }).catch(() => { err = true; });
    const returnData = { err, data: data?.data };
    return returnData;
  }
};
