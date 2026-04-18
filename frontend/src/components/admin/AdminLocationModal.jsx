import { useEffect, useMemo, useState } from "react";

const TAG_COLOR_COUNT = 8;

function getTagColorIndex(tag) {
    const value = String(tag || "").toLowerCase();
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash % TAG_COLOR_COUNT;
}

export default function AdminLocationModal({
    isOpen,
    editingLocationId,
    locationForm,
    locationSaving,
    typeOptions = [],
    tagOptions = [],
    onChange,
    onSubmit,
    onClose,
    onCancel,
}) {
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        if (isOpen) {
            setTagInput("");
        }
    }, [isOpen, editingLocationId]);

    const selectedTags = useMemo(
        () => String(locationForm.tags || "")
            .split(/[;,]/)
            .map((tag) => tag.trim())
            .filter(Boolean),
        [locationForm.tags]
    );

    const suggestedTags = useMemo(() => {
        const needle = tagInput.trim().toLowerCase();
        const selectedSet = new Set(selectedTags.map((tag) => tag.toLowerCase()));
        return tagOptions
            .filter((tag) => !selectedSet.has(String(tag).toLowerCase()))
            .filter((tag) => {
                if (!needle) return true;
                return String(tag).toLowerCase().includes(needle);
            });
    }, [tagInput, tagOptions, selectedTags]);

    if (!isOpen) return null;

    function updateTags(nextTags) {
        onChange({ target: { name: "tags", value: nextTags.join(";") } });
    }

    function addTag(rawTag) {
        const nextTag = String(rawTag || "").trim();
        if (!nextTag) return;

        const exists = selectedTags.some((tag) => tag.toLowerCase() === nextTag.toLowerCase());
        if (exists) {
            setTagInput("");
            return;
        }

        updateTags([...selectedTags, nextTag]);
        setTagInput("");
    }

    function removeTag(tagToRemove) {
        updateTags(selectedTags.filter((tag) => tag !== tagToRemove));
    }

    function handleTagKeyDown(event) {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addTag(tagInput);
        }
    }

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
                            <select
                                id="location-type"
                                className="form-control"
                                name="type"
                                value={locationForm.type}
                                onChange={onChange}
                                required
                            >
                                <option value="">Select a type</option>
                                {typeOptions.map((typeOption) => (
                                    <option key={typeOption} value={typeOption}>
                                        {typeOption}
                                    </option>
                                ))}
                            </select>
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
                                        <label className="form-label" htmlFor="location-price-tier">Price rating</label>
                                        <select
                                            id="location-price-tier"
                                            className="form-control"
                                            name="price_tier"
                                            value={locationForm.price_tier ?? ""}
                                            onChange={onChange}
                                        >
                                            <option value="">Not set</option>
                                            <option value="1">£ (Budget)</option>
                                            <option value="2">££ (Mid-range)</option>
                                            <option value="3">£££ (Premium)</option>
                                            <option value="4">££££ (Luxury)</option>
                                        </select>
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
                                        <div className="tt-admin-tags-wrap">
                                            {selectedTags.length > 0 && (
                                                <div className="tt-admin-tag-list" aria-label="Selected tags">
                                                    {selectedTags.map((tag) => (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            className={`tt-admin-tag-chip tt-tag-color-${getTagColorIndex(tag)}`}
                                                            onClick={() => removeTag(tag)}
                                                            aria-label={`Remove tag ${tag}`}
                                                            title="Remove tag"
                                                        >
                                                            <span>{tag}</span>
                                                            <span className="tt-admin-tag-chip-remove" aria-hidden="true">x</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="input-group tt-admin-tag-input-group">
                                                <input
                                                    id="location-tags"
                                                    className="form-control"
                                                    value={tagInput}
                                                    onChange={(event) => setTagInput(event.target.value)}
                                                    onKeyDown={handleTagKeyDown}
                                                    placeholder="Search existing tags or type a new one"
                                                />
                                                <button
                                                    type="button"
                                                    className="tt-btn"
                                                    onClick={() => addTag(tagInput)}
                                                    disabled={!tagInput.trim()}
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            {suggestedTags.length > 0 && (
                                                <div className="tt-admin-tag-suggestions" aria-label="Tag suggestions">
                                                    {suggestedTags.map((tag) => (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            className={`tt-admin-tag-suggestion tt-tag-color-${getTagColorIndex(tag)}`}
                                                            onClick={() => addTag(tag)}
                                                            title={`Add ${tag}`}
                                                        >
                                                            + {tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <small className="text-muted">
                                                Press Enter or Add to insert a tag. Click a tag chip to remove it.
                                            </small>
                                        </div>
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
