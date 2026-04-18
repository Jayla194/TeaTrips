export default function AdminLocationModal({
    isOpen,
    editingLocationId,
    locationForm,
    locationSaving,
    onChange,
    onSubmit,
    onClose,
    onCancel,
}) {
    if (!isOpen) return null;

    return (
        <div
            className="tt-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-location-modal-title"
            onClick={onClose}
        >
            <div className="tt-modal tt-admin-location-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tt-modal-header">
                    <div className="tt-modal-header-left">
                        <h3 id="admin-location-modal-title" className="tt-modal-title mb-0">
                            {editingLocationId ? "Edit Location" : "Add Location"}
                        </h3>
                    </div>
                    <button
                        type="button"
                        className="tt-btn tt-btn-ghost tt-admin-modal-close"
                        aria-label="Close add location modal"
                        onClick={onCancel}
                    >
                        x
                    </button>
                </div>

                <form className="tt-modal-body tt-admin-location-form" onSubmit={onSubmit}>
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="location-name">Name *</label>
                            <input
                                id="location-name"
                                className="form-control"
                                name="name"
                                value={locationForm.name}
                                onChange={onChange}
                                required
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="location-type">Type *</label>
                            <input
                                id="location-type"
                                className="form-control"
                                name="type"
                                value={locationForm.type}
                                onChange={onChange}
                                placeholder="e.g. Attraction, Hotel, Food"
                                required
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label" htmlFor="location-address">Address *</label>
                            <input
                                id="location-address"
                                className="form-control"
                                name="address"
                                value={locationForm.address}
                                onChange={onChange}
                                placeholder="Street, building, venue name"
                                required
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="location-city">City *</label>
                            <input
                                id="location-city"
                                className="form-control"
                                name="city"
                                value={locationForm.city}
                                onChange={onChange}
                                required
                            />
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label" htmlFor="location-postcode">Postcode *</label>
                            <input
                                id="location-postcode"
                                className="form-control"
                                name="postcode"
                                value={locationForm.postcode}
                                onChange={onChange}
                                required
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label" htmlFor="location-description">Short description</label>
                            <textarea
                                id="location-description"
                                className="form-control"
                                name="description_short"
                                value={locationForm.description_short}
                                onChange={onChange}
                                rows="2"
                                placeholder="One sentence users will see in cards"
                            />
                        </div>

                        <div className="col-12">
                            <details className="tt-admin-optional-details">
                                <summary>Optional details</summary>

                                <div className="row g-3 mt-1">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="location-phone">Phone</label>
                                        <input
                                            id="location-phone"
                                            className="form-control"
                                            name="phone"
                                            value={locationForm.phone}
                                            onChange={onChange}
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="location-hours">Opening hours</label>
                                        <input
                                            id="location-hours"
                                            className="form-control"
                                            name="opening_hours"
                                            value={locationForm.opening_hours}
                                            onChange={onChange}
                                            placeholder="e.g. 09:00-17:00"
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="location-website">Website</label>
                                        <input
                                            id="location-website"
                                            className="form-control"
                                            name="website"
                                            value={locationForm.website}
                                            onChange={onChange}
                                            type="url"
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label" htmlFor="location-image">Image URL</label>
                                        <input
                                            id="location-image"
                                            className="form-control"
                                            name="image_url"
                                            value={locationForm.image_url}
                                            onChange={onChange}
                                            type="url"
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label" htmlFor="location-tags">Tags</label>
                                        <input
                                            id="location-tags"
                                            className="form-control"
                                            name="tags"
                                            value={locationForm.tags}
                                            onChange={onChange}
                                            placeholder="e.g. Family;Food;Museum"
                                        />
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                    <div className="tt-modal-footer">
                        <button
                            type="button"
                            className="tt-btn tt-btn-ghost"
                            onClick={onCancel}
                            disabled={locationSaving}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="tt-btn" disabled={locationSaving}>
                            {locationSaving ? "Saving..." : editingLocationId ? "Save changes" : "Add location"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
