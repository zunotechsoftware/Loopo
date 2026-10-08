'use client';

import React, { useEffect, useState } from 'react';
import { X, Star, Send, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setReviewModalOpen, showToast } from '@/redux/slices/uiSlice';
import { submitSellerReviewThunk } from '@/redux/slices/ratingsSlice';
import { reviewsApi, ReviewTag, ReviewPhotoInput, RatingInput } from '@/services/reviewsApi';

const CATEGORY_FIELDS: { key: keyof RatingInput; label: string }[] = [
  { key: 'communication', label: 'Communication' },
  { key: 'productAccuracy', label: 'Product Accuracy' },
  { key: 'behaviour', label: 'Behaviour' },
  { key: 'deliveryExperience', label: 'Meeting Experience' },
];

const MAX_PHOTOS = 6;

function StarPicker({ value, onChange, size = 'w-8 h-8' }: { value: number; onChange: (v: number) => void; size?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          className="transition-transform hover:scale-110"
        >
          <Star className={`${size} ${star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isReviewModalOpen);
  const target = useAppSelector((state) => state.ui.reviewTarget);

  const [overall, setOverall] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [photos, setPhotos] = useState<(ReviewPhotoInput & { previewUrl: string })[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      reviewsApi.getTags().then((res) => {
        if (res.success && res.data) setTags(res.data);
      });
    } else {
      // Reset local form state once the modal fully closes so the next
      // eligibility it's opened for starts from a blank form.
      setOverall(0);
      setCategoryRatings({});
      setContent('');
      setSelectedTagIds([]);
      setPhotos([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !target) return null;

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : prev.length < 10 ? [...prev, id] : prev,
    );
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (photos.length >= MAX_PHOTOS) {
      setError(`You can attach up to ${MAX_PHOTOS} photos.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files can be attached.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Each photo must be under 5MB.');
      return;
    }
    setUploadingPhoto(true);
    setError(null);
    try {
      const uploaded = await reviewsApi.uploadReviewPhoto(file);
      if (!uploaded) throw new Error('Failed to upload photo');
      setPhotos((prev) => [...prev, { ...uploaded, previewUrl: uploaded.fileUrl }]);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (fileKey: string) => {
    setPhotos((prev) => prev.filter((p) => p.fileKey !== fileKey));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (overall < 1) {
      setError('Please select an overall star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const rating: RatingInput = { overall };
    for (const { key } of CATEGORY_FIELDS) {
      const v = categoryRatings[key];
      if (v && v > 0) (rating as any)[key] = v;
    }

    try {
      await dispatch(
        submitSellerReviewThunk({
          eligibilityId: target.eligibilityId,
          content: content.trim() || undefined,
          rating,
          tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
          photos: photos.length > 0 ? photos.map(({ fileUrl, fileKey }) => ({ fileUrl, fileKey })) : undefined,
        }),
      ).unwrap();
      dispatch(setReviewModalOpen(false));
      dispatch(showToast('Thanks! Your rating has been submitted.'));
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err?.message || 'Failed to submit your rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Rate & Review Seller</span>
          </div>
          <button
            onClick={() => dispatch(setReviewModalOpen(false))}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          How was your transaction with <span className="font-bold text-slate-700">{target.sellerName}</span> for{' '}
          <span className="font-bold text-slate-700">{target.productTitle}</span>?
        </p>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Overall Rating
            </span>
            <StarPicker value={overall} onChange={setOverall} />
          </div>

          <div className="space-y-2.5 bg-slate-50 rounded-2xl p-3.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Optional - Rate Specific Areas
            </span>
            {CATEGORY_FIELDS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{label}</span>
                <StarPicker
                  size="w-4 h-4"
                  value={categoryRatings[key] || 0}
                  onChange={(v) => setCategoryRatings((prev) => ({ ...prev, [key]: v }))}
                />
              </div>
            ))}
          </div>

          {tags.length > 0 && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                What stood out? (optional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors ${
                      selectedTagIds.includes(tag.id)
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-300'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Your Review (optional)
            </label>
            <textarea
              rows={3}
              maxLength={2000}
              placeholder="Was the seller responsive? Was the item as described?..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Photos (optional, up to {MAX_PHOTOS})
            </label>
            <div className="flex flex-wrap gap-2">
              {photos.map((p) => (
                <div key={p.fileKey} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
                  <img src={p.previewUrl} alt="Review attachment" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(p.fileKey)}
                    className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-emerald-400 text-slate-400">
                  {uploadingPhoto ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ImagePlus className="w-5 h-5" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} disabled={uploadingPhoto} />
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || uploadingPhoto}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
