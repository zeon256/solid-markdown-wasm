use criterion::{Criterion, black_box, criterion_group, criterion_main};
use markdown_renderer::{Themes, render_md};

pub fn criterion_benchmark(c: &mut Criterion) {
    let avg_markdown = include_str!("../sample-data/md0.md");
    let big_markdown = include_str!("../sample-data/md1.md");
    let big_syntax = include_str!("../sample-data/md2.md");

    c.bench_function("render_html (avg)", |b| {
        b.iter(|| render_md(black_box(avg_markdown), black_box(Themes::OneDark)))
    });
    c.bench_function("render_html (big)", |b| {
        b.iter(|| render_md(black_box(big_markdown), black_box(Themes::OneDark)))
    });
    c.bench_function("render_html (big_syntax)", |b| {
        b.iter(|| render_md(black_box(big_syntax), black_box(Themes::OneDark)))
    });
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
