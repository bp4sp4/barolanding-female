import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// 서비스 역할 키 사용 (RLS 우회)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, contact, privacyAgreed } = body

    // 필수 필드 검증
    if (!name || !contact) {
      return NextResponse.json(
        { error: '이름과 연락처를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!privacyAgreed) {
      return NextResponse.json(
        { error: '개인정보 처리방침에 동의해주세요.' },
        { status: 400 }
      )
    }

    // Supabase에 데이터 저장
    const { data, error } = await supabase
      .from('consultations')
      .insert([
        {
          name,
          contact,
          is_completed: false, // 신청 시에는 미완료 상태
        },
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: '데이터 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
