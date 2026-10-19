'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Download, Upload, Trash2, Edit3, X, Copy, Check, FileText, Languages } from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';

interface CardData {
  id: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  model: string;
  created_at: number;
  updated_at: number;
}

interface TagInfo {
  name: string;
  count: number;
}

// ===== i18n =====
type Lang = 'zh' | 'en';
const i18n = {
  zh: {
    tagline: '你的 AI 提示词卡片库',
    newCard: '新建卡片',
    newCardTitle: '新建卡片',
    editCardTitle: '编辑卡片',
    searchPh: '搜索标题、内容、描述…',
    title: '标题',
    titlePh: '给这张卡片起个名字',
    content: '内容（提示词）',
    contentPh: '在这里写下你的提示词…',
    desc: '描述（可选）',
    descPh: '这张卡片用来做什么？',
    model: '适用模型（可选）',
    modelPh: '如 GPT-4、Claude 3.5、DeepSeek…',
    tags: '标签',
    tagInputPh: '输入标签后回车',
    cancel: '取消',
    save: '保存',
    all: '全部',
    empty: '还没有卡片，点击右上角「新建卡片」开始',
    titleRequired: '标题和内容不能为空',
    deleteConfirm: '确定删除这张卡片？',
    importOk: (n: number) => `成功导入 ${n} 张卡片`,
    importFail: '文件格式错误，请检查 JSON',
    importTitle: '导入',
    exportTitle: '导出',
    copyTitle: '复制',
    shareTitle: '分享为图片',
    editTitle: '编辑',
    deleteTitle: '删除',
    langLabel: 'EN',
  },
  en: {
    tagline: 'Your AI prompt card library',
    newCard: 'New card',
    newCardTitle: 'New card',
    editCardTitle: 'Edit card',
    searchPh: 'Search title, content, description…',
    title: 'Title',
    titlePh: 'Give this card a name',
    content: 'Content (prompt)',
    contentPh: 'Write your prompt here…',
    desc: 'Description (optional)',
    descPh: 'What is this card for?',
    model: 'Model (optional)',
    modelPh: 'e.g. GPT-4, Claude 3.5, DeepSeek…',
    tags: 'Tags',
    tagInputPh: 'Type a tag and press Enter',
    cancel: 'Cancel',
    save: 'Save',
    all: 'All',
    empty: 'No cards yet. Click "New card" in the top right to start.',
    titleRequired: 'Title and content are required',
    deleteConfirm: 'Delete this card?',
    importOk: (n: number) => `Imported ${n} card(s)`,
    importFail: 'Invalid file format, please check the JSON',
    importTitle: 'Import',
    exportTitle: 'Export',
    copyTitle: 'Copy',
    shareTitle: 'Share as image',
    editTitle: 'Edit',
    deleteTitle: 'Delete',
    langLabel: '中',
  },
};

function getInitialLang(): Lang {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('promptcard-lang') : null;
  if (saved === 'zh' || saved === 'en') return saved;
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('en')) return 'en';
  return 'zh';
}

export default function Home() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string>('');
  const [editing, setEditing] = useState<CardData | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const t = (key: string, ...args: any[]) => {
    const entry = (i18n[lang] as any)[key];
    if (typeof entry === 'function') return entry(...args);
    return entry || key;
  };

  const switchLang = () => {
    const next = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    if (typeof localStorage !== 'undefined') localStorage.setItem('promptcard-lang', next);
  };

  // 加载卡片
  const loadCards = async (q?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (tag) params.set('tag', tag);
    const res = await fetch(`/api/cards?${params}`);
    const data = await res.json();
    setCards(data.cards || []);
  };

  const loadTags = async () => {
    const res = await fetch('/api/tags');
    const data = await res.json();
    setTags(data.tags || []);
  };

  useEffect(() => {
    const tm = setTimeout(() => loadCards(search, activeTag), 200);
    return () => clearTimeout(tm);
  }, [search, activeTag]);

  useEffect(() => {
    loadTags();
  }, [cards.length]);

  // 打开新建
  const handleNew = () => {
    setEditing({
      id: '',
      title: '',
      content: '',
      description: '',
      tags: [],
      model: '',
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    setShowEditor(true);
  };

  // 打开编辑
  const handleEdit = (card: CardData) => {
    setEditing({ ...card });
    setShowEditor(true);
  };

  // 保存（新建 or 更新）
  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.content.trim()) {
      alert(t('titleRequired'));
      return;
    }

    const method = editing.id ? 'PUT' : 'POST';
    const url = editing.id ? `/api/cards/${editing.id}` : '/api/cards';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editing.title,
        content: editing.content,
        description: editing.description,
        tags: editing.tags,
        model: editing.model,
      }),
    });

    if (res.ok) {
      setShowEditor(false);
      setEditing(null);
      loadCards(search, activeTag);
      loadTags();
    }
  };

  // 删除
  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    await fetch(`/api/cards/${id}`, { method: 'DELETE' });
    loadCards(search, activeTag);
    loadTags();
  };

  // 复制内容
  const handleCopy = async (card: CardData) => {
    await navigator.clipboard.writeText(card.content);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // 导出
  const handleExport = async () => {
    const res = await fetch('/api/export');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data.cards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptcard-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      const importCards = Array.isArray(data) ? data : data.cards;
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importCards),
      });
      const result = await res.json();
      alert(t('importOk', result.imported));
      loadCards(search, activeTag);
      loadTags();
    } catch {
      alert(t('importFail'));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 分享为图片
  const handleShareImage = async (card: CardData) => {
    const { toPng } = await import('html-to-image');
    const node = document.createElement('div');
    node.style.cssText = 'width:480px;padding:40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:20px;color:white;font-family:-apple-system,sans-serif;position:absolute;left:-9999px;top:0;';
    node.innerHTML = `
      <div style="font-size:12px;opacity:0.8;margin-bottom:8px;">PromptCard</div>
      <div style="font-size:22px;font-weight:600;margin-bottom:16px;">${card.title}</div>
      <div style="font-size:14px;line-height:1.7;white-space:pre-wrap;max-height:320px;overflow:hidden;opacity:0.95;">${card.content.slice(0, 400)}</div>
      <div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap;">${card.tags.map((tag) => `<span style="background:rgba(255,255,255,0.2);padding:4px 10px;border-radius:12px;font-size:11px;">#${tag}</span>`).join('')}</div>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.2);font-size:11px;opacity:0.7;">github.com/yourname/promptcard</div>
    `;
    document.body.appendChild(node);
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `promptcard-${card.id}.png`;
      a.click();
    } finally {
      document.body.removeChild(node);
    }
  };

  // 标签输入
  const [tagInput, setTagInput] = useState('');
  const addTag = () => {
    if (!editing || !tagInput.trim()) return;
    if (!editing.tags.includes(tagInput.trim())) {
      setEditing({ ...editing, tags: [...editing.tags, tagInput.trim()] });
    }
    setTagInput('');
  };
  const removeTag = (tg: string) => {
    if (!editing) return;
    setEditing({ ...editing, tags: editing.tags.filter((x) => x !== tg) });
  };

  return (
    <div className="min-h-screen">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-20 border-b border-gray-200/60 bg-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <FileText size={18} color="white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">PromptCard</h1>
              <p className="text-xs text-ink-muted">{t('tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={switchLang} className="px-2.5 py-1.5 text-xs font-medium text-ink-muted hover:bg-bg-hover rounded-lg transition border border-gray-200" title="Switch language">
              {t('langLabel')}
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-bg-hover rounded-lg transition" title={t('importTitle')}>
              <Upload size={18} className="text-ink-muted" />
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <button onClick={handleExport} className="p-2 hover:bg-bg-hover rounded-lg transition" title={t('exportTitle')}>
              <Download size={18} className="text-ink-muted" />
            </button>
            <button onClick={handleNew} className="ml-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition flex items-center gap-1.5">
              <Plus size={16} /> {t('newCard')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 搜索 + 标签栏 */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPh')}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition"
            />
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag('')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition',
                  !activeTag ? 'bg-accent text-white' : 'bg-bg-card text-ink-muted hover:bg-bg-hover border border-gray-200'
                )}
              >
                {t('all')} ({cards.length})
              </button>
              {tags.map((tg) => (
                <button
                  key={tg.name}
                  onClick={() => setActiveTag(activeTag === tg.name ? '' : tg.name)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition',
                    activeTag === tg.name ? 'bg-accent text-white' : 'bg-bg-card text-ink-muted hover:bg-bg-hover border border-gray-200'
                  )}
                >
                  {tg.name} ({tg.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 卡片列表 */}
        {cards.length === 0 ? (
          <div className="text-center py-24 text-ink-muted">
            <FileText size={48} className="mx-auto mb-4 text-ink-light" />
            <p className="text-sm">{t('empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="card-enter group bg-bg-card border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition flex flex-col"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm leading-snug flex-1 line-clamp-2">{card.title}</h3>
                  {card.model && (
                    <span className="ml-2 shrink-0 px-2 py-0.5 bg-accent-light text-accent rounded text-[10px] font-mono">
                      {card.model}
                    </span>
                  )}
                </div>

                {card.description && (
                  <p className="text-xs text-ink-muted mb-2 line-clamp-1">{card.description}</p>
                )}

                <p className="text-xs text-ink-muted font-mono line-clamp-3 flex-1 mb-3">
                  {card.content}
                </p>

                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {card.tags.slice(0, 4).map((tg) => (
                      <span key={tg} className="px-2 py-0.5 bg-gray-100 text-ink-muted rounded text-[10px]">
                        #{tg}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-[10px] text-ink-light">{formatTime(card.updated_at)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleCopy(card)} className="p-1.5 hover:bg-bg-hover rounded text-ink-muted" title={t('copyTitle')}>
                      {copiedId === card.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                    <button onClick={() => handleShareImage(card)} className="p-1.5 hover:bg-bg-hover rounded text-ink-muted" title={t('shareTitle')}>
                      <Download size={14} />
                    </button>
                    <button onClick={() => handleEdit(card)} className="p-1.5 hover:bg-bg-hover rounded text-ink-muted" title={t('editTitle')}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(card.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500" title={t('deleteTitle')}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 编辑器抽屉 */}
      {showEditor && editing && (
        <div className="fixed inset-0 z-30 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowEditor(false)} />
          <div className="relative w-full max-w-xl bg-bg-card h-full shadow-2xl flex flex-col animate-[fadeInUp_0.2s_ease-out]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold">{editing.id ? t('editCardTitle') : t('newCardTitle')}</h2>
              <button onClick={() => setShowEditor(false)} className="p-1 hover:bg-bg-hover rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">{t('title')}</label>
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder={t('titlePh')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">{t('content')}</label>
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  placeholder={t('contentPh')}
                  className="w-full auto-grow px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">{t('desc')}</label>
                <input
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder={t('descPh')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">{t('model')}</label>
                <input
                  value={editing.model}
                  onChange={(e) => setEditing({ ...editing, model: e.target.value })}
                  placeholder={t('modelPh')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-ink-muted mb-1.5 block">{t('tags')}</label>
                <div className="flex gap-2 mb-2">
                  <input
                    ref={tagInputRef}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder={t('tagInputPh')}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light"
                  />
                  <button onClick={addTag} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                    <Plus size={16} />
                  </button>
                </div>
                {editing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {editing.tags.map((tg) => (
                      <span key={tg} className="px-2.5 py-1 bg-accent-light text-accent rounded-full text-xs flex items-center gap-1">
                        #{tg}
                        <button onClick={() => removeTag(tg)}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => setShowEditor(false)} className="px-4 py-2 text-sm text-ink-muted hover:bg-bg-hover rounded-lg">
                {t('cancel')}
              </button>
              <button onClick={handleSave} className="px-5 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
