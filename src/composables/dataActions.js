import { getErrorMessage } from '../api/client.js';
import { placeToApi } from '../api/mappers.js';
import { PLACE_STATUS } from '../utils/placeStatus.js';
import {
  fetchMarkets,
  fetchPlaces,
  fetchMerchants,
  fetchPlaceRequests,
  fetchReceipts,
  fetchUsers,
  createUser,
  updateUserApi,
  deleteUserApi,
  createMarket,
  updateMarket as apiUpdateMarket,
  deleteMarketApi,
  fetchBlocks,
  createBlock,
  updateBlockApi,
  deleteBlockApi,
  createPlace,
  updatePlaceApi,
  deletePlaceApi,
  assignPlaceChief,
  createPlaceRequest,
  approvePlaceRequest,
  rejectPlaceRequest,
  createReceipt,
  approveReceipt,
  rejectReceipt,
} from '../api/services/data.js';
import { sameId } from '../utils/ids.js';

export function createDataActions(state) {
  let refreshPublicData = null;
  let refreshAllData = null;

  const bindRefreshers = ({ refreshPublicData: publicRefresher, refreshAllData: allRefresher }) => {
    refreshPublicData = publicRefresher;
    refreshAllData = allRefresher;
  };

  const loadBlocks = async (marketIds = null) => {
    const ids = marketIds || state.markets.value.map((m) => m.id);
    if (!ids.length) {
      state.blocks.value = [];
      return;
    }
    const results = await Promise.all(ids.map((id) => fetchBlocks(id)));
    state.blocks.value = results.flat();
  };

  const loadPublicCoreData = async () => {
    state.markets.value = await fetchMarkets();
  };

  const loadPublicSupplementalData = async () => {
    const [places, merchants] = await Promise.all([
      fetchPlaces(),
      fetchMerchants(),
    ]);
    state.places.value = places;
    state.merchants.value = merchants;
    return {
      places,
      merchants,
    };
  };

  const loadPublicData = async () => {
    await loadPublicCoreData();
    await loadPublicSupplementalData();
  };

  const loadAuthenticatedData = async () => {
    const user = state.currentUser.value;
    const [requests, receipts] = await Promise.all([
      fetchPlaceRequests(user),
      fetchReceipts(user),
    ]);
    state.requests.value = requests;
    state.receipts.value = receipts;
  };

  const loadUsers = async () => {
    if (!['SUPER_ADMIN', 'ADMIN_MARCHE'].includes(state.currentUser.value?.role)) {
      state.users.value = [];
      return state.users.value;
    }
    state.usersLoading.value = true;
    try {
      state.users.value = await fetchUsers();
      return state.users.value;
    } catch (error) {
      state.showToast(getErrorMessage(error, 'Erreur de chargement des utilisateurs'), 'error');
      return state.users.value;
    } finally {
      state.usersLoading.value = false;
    }
  };

  const addPlaceRequest = async (req) => {
    try {
      const created = await createPlaceRequest(req);
      state.requests.value = [created, ...state.requests.value];
      state.showToast("Demande d'octroi de place envoyée avec succès", 'success');
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
    }
  };

  const addPaymentReceipt = async (rec) => {
    try {
      const formData = new FormData();
      if (rec.file) {
        formData.append('file', rec.file);
      }
      formData.append('place_id', rec.placeId);
      formData.append('period_year', rec.periodYear);
      formData.append('period_month', rec.periodMonth);
      formData.append('payment_method_id', rec.paymentMethodId);

      const created = await createReceipt(formData);
      state.receipts.value = [created, ...state.receipts.value];
      state.showToast('Reçu téléversé avec succès pour validation', 'success');
      return created;
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
      return null;
    }
  };

  const updateRequestStatus = async (reqId, status, reason = '') => {
    try {
      let updated;
      if (status === 'approved') {
        updated = await approvePlaceRequest(reqId);
      } else {
        updated = await rejectPlaceRequest(reqId, reason || 'Demande non conforme');
      }
      state.requests.value = state.requests.value.map((r) => (r.id === reqId ? updated : r));
      if (status === 'approved' && refreshAllData) {
        await refreshAllData();
      }
      state.showToast(
        `Demande ${status === 'approved' ? 'approuvée' : 'rejetée'}`,
        status === 'approved' ? 'success' : 'error',
      );
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
    }
  };

  const updateReceiptStatus = async (recId, status, reason = '') => {
    try {
      const updated =
        status === 'approved'
          ? await approveReceipt(recId)
          : await rejectReceipt(recId, reason || 'Justificatif non conforme');
      state.receipts.value = state.receipts.value.map((r) => (r.id === recId ? updated : r));
      state.showToast(
        `Reçu ${status === 'approved' ? 'validé' : 'rejeté'}`,
        status === 'approved' ? 'success' : 'error',
      );
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
    }
  };

  const addMarket = async (market) => {
    try {
      const created = await createMarket(market);
      state.markets.value = [created, ...state.markets.value];
      state.showToast(`Marché "${market.name}" créé avec succès`, 'success');
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
    }
  };

  const updateMarket = async (market) => {
    try {
      const updated = await apiUpdateMarket(market.id, market);
      state.markets.value = state.markets.value.map((m) => (m.id === market.id ? updated : m));
      state.showToast(`Marché "${market.name}" mis à jour`, 'success');
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
    }
  };

  const deleteMarket = async (id) => {
    try {
      await deleteMarketApi(id);
      state.markets.value = state.markets.value.filter((m) => m.id !== id);
      state.showToast('Marché retiré du registre', 'success');
      return true;
    } catch (error) {
      state.showToast(getErrorMessage(error, 'Impossible de supprimer ce marché'), 'error');
      return false;
    }
  };

  const addBlock = async (block) => {
    try {
      const created = await createBlock(block.marketId, block);
      state.blocks.value = [...state.blocks.value, created];
      state.showToast(`Bloc "${block.name}" créé`, 'success');
      return created;
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
      return null;
    }
  };

  const updateBlock = async (block) => {
    try {
      const updated = await updateBlockApi(block.id, block);
      state.blocks.value = state.blocks.value.map((b) => (b.id === block.id ? updated : b));
      state.showToast(`Bloc "${block.name}" mis à jour`, 'success');
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
    }
  };

  const deleteBlock = async (id) => {
    try {
      await deleteBlockApi(id);
      state.blocks.value = state.blocks.value.filter((b) => b.id !== id);
      state.showToast('Bloc supprimé', 'success');
      return true;
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
      return false;
    }
  };

  const addPlace = async (place) => {
    try {
      const created = await createPlace(place);
      state.places.value = [...state.places.value, created];
      if (refreshPublicData) {
        await refreshPublicData();
      }
      state.showToast(`Emplacement ${place.id} ajouté`, 'success');
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
    }
  };

  const updatePlace = async (place) => {
    if (!place?.placeId) {
      state.showToast('Emplacement introuvable', 'error');
      return null;
    }
    try {
      const updated = await updatePlaceApi(place.placeId, placeToApi(place));
      state.places.value = state.places.value.map((p) =>
        p.placeId === place.placeId || (p.id === place.id && p.marketId === place.marketId)
          ? updated
          : p,
      );
      if (refreshPublicData) {
        await refreshPublicData();
      }
      state.showToast(`Emplacement ${place.id} mis à jour`, 'success');
      return updated;
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
      return null;
    }
  };

  const deletePlace = async (place) => {
    if (!place?.placeId) {
      state.showToast('Emplacement introuvable', 'error');
      return false;
    }
    try {
      await deletePlaceApi(place.placeId);
      state.places.value = state.places.value.filter(
        (p) => !(p.placeId === place.placeId || (p.id === place.id && p.marketId === place.marketId)),
      );
      if (refreshPublicData) {
        await refreshPublicData();
      }
      state.showToast(`Emplacement ${place.id} supprimé`, 'success');
      return true;
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
      return false;
    }
  };

  const addUser = async (user) => {
    try {
      const created = await createUser(user);
      state.users.value = [created, ...state.users.value];
      state.showToast(`Utilisateur "${user.name}" créé avec succès`, 'success');
      return created;
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
      return null;
    }
  };

  const updateUser = async (user) => {
    try {
      const updated = await updateUserApi(user.id, user);
      state.users.value = state.users.value.map((u) => (sameId(u.id, user.id) ? updated : u));
      state.showToast(`Utilisateur "${user.name}" mis à jour`, 'success');
      return updated;
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
      return null;
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteUserApi(id);
      state.users.value = state.users.value.filter((u) => !sameId(u.id, id));
      state.showToast('Utilisateur supprimé', 'success');
      return true;
    } catch (error) {
      state.showToast(getErrorMessage(error, 'Impossible de supprimer cet utilisateur'), 'error');
      return false;
    }
  };

  const toggleUserActive = async (id, isActive) => {
    const user = state.users.value.find((u) => sameId(u.id, id));
    if (!user) return;
    try {
      const updated = await updateUserApi(id, { ...user, isActive });
      state.users.value = state.users.value.map((u) => (sameId(u.id, id) ? updated : u));
      state.showToast(
        `Compte ${isActive ? 'activé' : 'désactivé'}`,
        isActive ? 'success' : 'info',
      );
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
    }
  };

  const updatePlaceStatus = async (placeNumber, marketId, status, merchantId) => {
    const place = state.places.value.find((p) => p.id === placeNumber && p.marketId === marketId);
    if (!place?.placeId) {
      state.showToast('Emplacement introuvable', 'error');
      return;
    }
    try {
      await updatePlaceApi(place.placeId, placeToApi({
        ...place,
        marketId: marketId || place.marketId,
        blockId: place.blockId,
        id: place.id,
        number: place.number || place.id,
        status,
        category: place.category || null,
      }));
      if (merchantId && status === PLACE_STATUS.OCCUPIED) {
        await assignPlaceChief(place.placeId, merchantId);
      }
      if (refreshPublicData) {
        await refreshPublicData();
      }
      state.showToast(`Emplacement ${placeNumber} mis à jour`, 'info');
    } catch (error) {
      state.showToast(getErrorMessage(error), 'error');
    }
  };

  return {
    bindRefreshers,
    loadBlocks,
    loadPublicCoreData,
    loadPublicSupplementalData,
    loadPublicData,
    loadAuthenticatedData,
    loadUsers,
    addPlaceRequest,
    addPaymentReceipt,
    updateRequestStatus,
    updateReceiptStatus,
    addMarket,
    updateMarket,
    deleteMarket,
    addBlock,
    updateBlock,
    deleteBlock,
    addPlace,
    updatePlace,
    deletePlace,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    updatePlaceStatus,
  };
}
